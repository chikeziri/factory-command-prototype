import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, Search, Filter, ArrowUpDown, AlertTriangle, Warehouse } from 'lucide-react'
import api from '../lib/api'

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const { data: items } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const res = await api.get('/api/v1/inventory/items')
      return res.data.data
    }
  })

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await api.get('/api/v1/inventory/warehouses')
      return res.data.data
    }
  })

  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'low' && parseFloat(item.quantityOnHand) <= parseFloat(item.reorderPoint)) ||
                         (filter === 'active' && item.status === 'active')
    return matchesSearch && matchesFilter
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
          <h1 className="page-title">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Track stock levels and movements</p>
        </div>
        <button className="btn-primary">
          <Package className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Warehouses */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {warehouses?.map((wh) => (
          <div key={wh.id} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{wh.name}</p>
                <p className="text-xs text-slate-500">{wh._count.items} items</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('low')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'low' ? 'bg-danger text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Low Stock
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-success text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Active
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SKU</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Item</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Warehouse</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Stock</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Unit Cost</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems?.map((item) => {
                const isLow = parseFloat(item.quantityOnHand) <= parseFloat(item.reorderPoint)
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-400">{item.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-slate-600">{item.binLocation}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{item.warehouse?.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-medium text-white">{item.quantityOnHand}</span>
                        <span className="text-xs text-slate-500">{item.unitOfMeasure}</span>
                        {isLow && <AlertTriangle className="w-4 h-4 text-warning" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-400">{formatNaira(item.unitCost)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${isLow ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                        {isLow ? 'Low Stock' : 'OK'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredItems?.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        )}
      </div>
    </div>
  )
}
