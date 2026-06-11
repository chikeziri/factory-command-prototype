import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Calculator, BookOpen, FileText, Landmark, Users, TrendingUp } from 'lucide-react'
import api from '../lib/api'

function ChartOfAccounts() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/api/v1/erp/accounts')
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

  const typeColors = {
    asset: 'text-brand-400',
    liability: 'text-warning',
    equity: 'text-success',
    revenue: 'text-cyan-400',
    expense: 'text-danger'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Chart of Accounts</h3>
        <button className="btn-secondary text-sm">
          <BookOpen className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Code</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Account Name</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Type</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {accounts?.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm font-mono text-slate-400">{acc.accountCode}</td>
                <td className="px-4 py-3 text-sm text-white">{acc.accountName}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium capitalize ${typeColors[acc.accountType] || 'text-slate-400'}`}>
                    {acc.accountType}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-white">{formatNaira(acc.currentBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function JournalEntries() {
  const { data: entries } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const res = await api.get('/api/v1/erp/journal-entries')
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Journal Entries</h3>
        <button className="btn-primary text-sm">
          <FileText className="w-4 h-4" />
          New Entry
        </button>
      </div>

      <div className="space-y-3">
        {entries?.map((entry) => (
          <div key={entry.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-brand-400">{entry.entryNumber}</span>
                  {entry.isPosted && (
                    <span className="badge bg-success/20 text-success text-xs">Posted</span>
                  )}
                </div>
                <p className="text-sm text-white mt-1">{entry.reference}</p>
                <p className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()} • {entry.creator?.firstName} {entry.creator?.lastName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{formatNaira(entry.totalDebit)}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
              {entry.lines?.map((line, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{line.account?.accountCode} — {line.account?.accountName}</span>
                  <div className="flex gap-4">
                    {parseFloat(line.debit) > 0 && <span className="text-white">{formatNaira(line.debit)}</span>}
                    {parseFloat(line.credit) > 0 && <span className="text-slate-400">{formatNaira(line.credit)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FinancialReports() {
  const { data: pl } = useQuery({
    queryKey: ['profit-loss'],
    queryFn: async () => {
      const res = await api.get('/api/v1/erp/profit-loss')
      return res.data.data
    }
  })

  const { data: trialBalance } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: async () => {
      const res = await api.get('/api/v1/erp/trial-balance')
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
      {/* P&L Summary */}
      <div className="card p-5">
        <h3 className="section-title">Profit & Loss Statement</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Revenue</p>
            <p className="text-xl font-bold text-success">{formatNaira(pl?.revenue)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Cost of Sales</p>
            <p className="text-xl font-bold text-danger">{formatNaira(pl?.cogs)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Gross Profit</p>
            <p className="text-xl font-bold text-brand-400">{formatNaira(pl?.grossProfit)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Net Profit</p>
            <p className="text-xl font-bold text-cyan-400">{formatNaira(pl?.netProfit)}</p>
          </div>
        </div>
      </div>

      {/* Trial Balance */}
      <div className="card overflow-hidden">
        <h3 className="section-title p-5 pb-0">Trial Balance</h3>
        <table className="w-full mt-4">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-5 py-3">Account</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Debit</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Credit</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase px-5 py-3">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {trialBalance?.accounts?.map((acc) => (
              <tr key={acc.accountCode} className="hover:bg-slate-800/30">
                <td className="px-5 py-3">
                  <span className="text-sm font-mono text-slate-500">{acc.accountCode}</span>
                  <span className="text-sm text-white ml-2">{acc.accountName}</span>
                </td>
                <td className="px-5 py-3 text-right text-sm text-slate-400">{formatNaira(acc.debit)}</td>
                <td className="px-5 py-3 text-right text-sm text-slate-400">{formatNaira(acc.credit)}</td>
                <td className="px-5 py-3 text-right text-sm text-white">{formatNaira(acc.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-700 bg-slate-800/30">
              <td className="px-5 py-3 text-sm font-bold text-white">TOTAL</td>
              <td className="px-5 py-3 text-right text-sm font-bold text-white">{formatNaira(trialBalance?.totals?.debit)}</td>
              <td className="px-5 py-3 text-right text-sm font-bold text-white">{formatNaira(trialBalance?.totals?.credit)}</td>
              <td className="px-5 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const tabs = [
  { path: '/erp', label: 'Chart of Accounts', icon: BookOpen },
  { path: '/erp/journal', label: 'Journal Entries', icon: FileText },
  { path: '/erp/reports', label: 'Financial Reports', icon: TrendingUp },
]

export default function ERP() {
  const location = useLocation()

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">ERP & Finance</h1>
          <p className="text-slate-500 text-sm mt-1">Accounting, payroll, and financial management</p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      <Routes>
        <Route path="/" element={<ChartOfAccounts />} />
        <Route path="/journal" element={<JournalEntries />} />
        <Route path="/reports" element={<FinancialReports />} />
      </Routes>
    </div>
  )
}
