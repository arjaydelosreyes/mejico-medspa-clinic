'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Archive, Edit2, Check, X as XIcon } from 'lucide-react'

type Service = { id: string; name: string }
type Treatment = { id: string; service_id: string; name: string; description: string | null; price: number; is_archived: boolean }

const EMPTY_FORM = { service_id: '', name: '', description: '', price: 0 }

export default function TreatmentsPage() {
  const [services, setServices] = useState<Service[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [filterService, setFilterService] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', price: 0 })

  async function load() {
    const supabase = createClient()
    const [{ data: svcs }, { data: trmts }] = await Promise.all([
      supabase.from('services').select('id, name').eq('is_archived', false).order('name'),
      supabase.from('treatments').select('*').order('name'),
    ])
    setServices(svcs ?? [])
    setTreatments(trmts ?? [])
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('treatments').insert(form)
    if (error) { toast.error('Failed to add.'); return }
    toast.success('Treatment added!'); setShowForm(false); setForm({ ...EMPTY_FORM }); load()
  }

  async function handleSaveEdit(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('treatments').update(editForm).eq('id', id)
    if (error) { toast.error('Failed to update.'); return }
    toast.success('Updated!'); setEditId(null); load()
  }

  async function handleArchive(t: Treatment) {
    const supabase = createClient()
    await supabase.from('treatments').update({ is_archived: !t.is_archived, archived_at: t.is_archived ? null : new Date().toISOString() }).eq('id', t.id)
    toast.success(t.is_archived ? 'Restored.' : 'Archived.')
    load()
  }

  const filtered = filterService ? treatments.filter(t => t.service_id === filterService) : treatments
  const inputCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-full'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Treatments</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium bg-brand">
          <Plus size={16} /> Add Treatment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-gray-500">Service</label>
            <select className={inputCls} value={form.service_id} onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))} required>
              <option value="">Select service</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-gray-500">Name</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-gray-500">Price (₱)</label>
            <input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
          </div>
          <div className="col-span-2 md:col-span-4">
            <label className="text-xs text-gray-500">Description</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="col-span-2 md:col-span-4 flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl text-white text-sm font-medium bg-brand">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex gap-3 mb-4">
        <select value={filterService} onChange={e => setFilterService(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
          <option value="">All Services</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-purple-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const svc = services.find(s => s.id === t.service_id)
              return (
                <tr key={t.id} className={`border-t ${t.is_archived ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-brand-dark">
                    {editId === t.id ? <input className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /> : t.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{svc?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {editId === t.id ? <input type="number" step="0.01" className={`${inputCls} w-28`} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} /> : `₱${Number(t.price).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.is_archived ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {t.is_archived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {editId === t.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(t.id)} className="text-green-600"><Check size={16} /></button>
                          <button onClick={() => setEditId(null)} className="text-gray-400"><XIcon size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(t.id); setEditForm({ name: t.name, description: t.description ?? '', price: t.price }) }} className="text-blue-500"><Edit2 size={14} /></button>
                          <button onClick={() => handleArchive(t)} className="text-gray-400 hover:text-red-500"><Archive size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No treatments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
