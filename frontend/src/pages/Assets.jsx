import { useQuery } from '@tanstack/react-query'
import { Laptop, Car, Wrench, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../lib/api'

const categoryIcons = {
  laptop: Laptop,
  vehicle: Car,
  default: Wrench
}

const statusColors = {
  available: 'bg-success/20 text-success',
  assigned: 'bg-brand-500/20 text-brand-400',
  maintenance: 'bg-warning/20 text-warning',
  retired: 'bg-slate-700 text-slate-400'
}

export default function Assets() {
  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await api.get('/api/v1/assets')
      return res.data.data
    }
  })

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Assets</h1>
          <p className="text-slate-500 text-sm mt-1">Track equipment, laptops, and vehicles</p>
        </div>
        <button className="btn-primary">
          <Laptop className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-white">{assets?.length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Total Assets</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-success">{assets?.filter(a => a.status === 'available').length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Available</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-400">{assets?.filter(a => a.status === 'assigned').length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Assigned</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {formatNaira(assets?.reduce((sum, a) => sum + parseFloat(a.currentValue || 0), 0))}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Value</p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assets?.map((asset) => {
          const Icon = categoryIcons[asset.category] || categoryIcons.default
          return (
            <div key={asset.id} className="card-hover p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{asset.name}</h3>
                    <p className="text-xs text-slate-500">{asset.assetTag}</p>
                  </div>
                </div>
                <span className={`badge ${statusColors[asset.status] || statusColors.default}`}>
                  {asset.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Brand/Model</span>
                  <span className="text-white">{asset.brand} {asset.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Serial</span>
                  <span className="text-slate-400 font-mono text-xs">{asset.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="text-white">{asset.location || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned To</span>
                  <span className="text-white">
                    {asset.assignments?.[0]?.user ? 
                      `${asset.assignments[0].user.firstName} ${asset.assignments[0].user.lastName}` : 
                      'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Value</span>
                  <span className="text-white">{formatNaira(asset.currentValue)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
