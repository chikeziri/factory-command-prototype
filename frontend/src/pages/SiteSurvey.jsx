import { useEffect, useMemo, useState } from 'react'
import { Download, Plus, Save, Trash2, ClipboardList, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  ABBREVIATIONS,
  CATEGORIES,
  CONFERENCE_ITEMS,
  STORAGE_KEY,
  WALK_AREAS,
  emptyForm,
  getFieldsForCategory,
} from '../lib/siteSurveySchema'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { entries: [], conference: {}, walkAreas: {} }
  } catch {
    return { entries: [], conference: {}, walkAreas: {} }
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function FieldInput({ field, value, onChange }) {
  const base = 'input-field w-full'

  if (field.type === 'textarea') {
    return (
      <textarea
        className={`${base} min-h-[80px]`}
        value={value || ''}
        placeholder={field.placeholder || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select className={base} value={value || ''} onChange={(e) => onChange(field.key, e.target.value)}>
        <option value="">Select…</option>
        {field.options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      className={base}
      value={value || ''}
      placeholder={field.placeholder || ''}
      onChange={(e) => onChange(field.key, e.target.value)}
    />
  )
}

function exportJson(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sifos-site-survey-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function exportCsv(entries) {
  if (!entries.length) return

  const keys = [...new Set(entries.flatMap((entry) => Object.keys(entry.data)))]
  const header = ['id', 'category', 'savedAt', ...keys]
  const rows = entries.map((entry) => [
    entry.id,
    entry.categoryLabel,
    entry.savedAt,
    ...keys.map((key) => entry.data[key] ?? ''),
  ])

  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sifos-site-survey-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function SiteSurvey() {
  const [activeCategory, setActiveCategory] = useState('cctv')
  const [form, setForm] = useState(emptyForm('cctv'))
  const [state, setState] = useState(loadState)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const categoryMeta = useMemo(
    () => CATEGORIES.find((item) => item.id === activeCategory),
    [activeCategory]
  )

  const fields = useMemo(() => getFieldsForCategory(activeCategory), [activeCategory])

  const categoryEntries = state.entries.filter((entry) => entry.category === activeCategory)

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId)
    setEditingId(null)
    if (categoryId !== 'conference' && categoryId !== 'glossary') {
      setForm(emptyForm(categoryId))
    }
  }

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveEntry = (e) => {
    e.preventDefault()

    if (!form.area?.trim() || !form.deviceName?.trim()) {
      toast.error('Area and device name are required')
      return
    }

    const entry = {
      id: editingId || crypto.randomUUID(),
      category: activeCategory,
      categoryLabel: categoryMeta?.label || activeCategory,
      savedAt: new Date().toISOString(),
      data: { ...form },
    }

    setState((prev) => ({
      ...prev,
      entries: editingId
        ? prev.entries.map((item) => (item.id === editingId ? entry : item))
        : [entry, ...prev.entries],
    }))

    toast.success(editingId ? 'Entry updated' : 'Entry saved')
    setEditingId(null)
    setForm(emptyForm(activeCategory))
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setForm({ ...entry.data })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    setState((prev) => ({ ...prev, entries: prev.entries.filter((item) => item.id !== id) }))
    if (editingId === id) {
      setEditingId(null)
      setForm(emptyForm(activeCategory))
    }
    toast.success('Entry removed')
  }

  const toggleConference = (key) => {
    setState((prev) => ({
      ...prev,
      conference: { ...prev.conference, [key]: !prev.conference[key] },
    }))
  }

  const toggleWalkArea = (area) => {
    setState((prev) => ({
      ...prev,
      walkAreas: { ...prev.walkAreas, [area]: !prev.walkAreas[area] },
    }))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">SIFOS Site Survey</h1>
            <p className="text-xs text-slate-500">Ikeduru Factory • saves on this phone automatically</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary text-xs py-2"
              onClick={() => { exportJson(state); toast.success('JSON exported') }}
            >
              <Download className="w-4 h-4" /> JSON
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-2"
              onClick={() => {
                if (!state.entries.length) { toast.error('No entries yet'); return }
                exportCsv(state.entries)
                toast.success('CSV exported')
              }}
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4 pb-24">
        <div className="card p-3">
          <p className="text-xs text-slate-400 mb-2">Saved entries: <strong className="text-white">{state.entries.length}</strong></p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {activeCategory === 'glossary' && (
          <div className="card p-4 space-y-3">
            <h2 className="section-title mb-0">Abbreviations</h2>
            {ABBREVIATIONS.map((item) => (
              <div key={item.term} className="border-b border-slate-800 pb-2 last:border-0">
                <p className="text-sm font-semibold text-brand-400">{item.term}</p>
                <p className="text-sm text-slate-400">{item.meaning}</p>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'conference' && (
          <div className="space-y-4">
            <div className="card p-4">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> Conference call checklist
              </h2>
              <div className="space-y-2">
                {CONFERENCE_ITEMS.map((item) => (
                  <label key={item.key} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!state.conference[item.key]}
                      onChange={() => toggleConference(item.key)}
                      className="mt-1"
                    />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Walk areas visited
              </h2>
              <div className="space-y-2">
                {WALK_AREAS.map((area) => (
                  <label key={area} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!state.walkAreas[area]}
                      onChange={() => toggleWalkArea(area)}
                      className="mt-1"
                    />
                    <span className="text-sm text-slate-300">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory !== 'glossary' && activeCategory !== 'conference' && (
          <>
            <form onSubmit={handleSaveEntry} className="card p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="section-title mb-0">{categoryMeta?.icon} {categoryMeta?.label}</h2>
                {editingId && (
                  <button
                    type="button"
                    className="text-xs text-slate-400"
                    onClick={() => { setEditingId(null); setForm(emptyForm(activeCategory)) }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-danger ml-1">*</span>}
                  </label>
                  <FieldInput field={field} value={form[field.key]} onChange={handleFieldChange} />
                </div>
              ))}

              <button type="submit" className="btn-primary w-full justify-center">
                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Update entry' : 'Save entry'}
              </button>
            </form>

            {categoryEntries.length > 0 && (
              <div className="card p-4 space-y-3">
                <h3 className="font-semibold text-white">Saved for this category ({categoryEntries.length})</h3>
                {categoryEntries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-slate-800/50 rounded-lg flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{entry.data.deviceName}</p>
                      <p className="text-xs text-slate-500">{entry.data.area} • {entry.data.brand} {entry.data.model}</p>
                      <p className="text-xs text-slate-600 mt-1">{new Date(entry.savedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="text-xs text-brand-400" onClick={() => handleEdit(entry)}>Edit</button>
                      <button type="button" className="text-xs text-danger" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
