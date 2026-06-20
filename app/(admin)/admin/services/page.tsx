'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Archive, Check, X as XIcon, Edit2 } from 'lucide-react'

type Service = { id: string; name: string; duration_minutes: number; is_archived: boolean }

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', duration_minutes: 60 })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', duration_minutes: 60 })

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('services').select('*').order('name')
    setServices(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('services').insert(form)
    if (error) { toast.error('Failed to add.'); return }
    toast.success('Service added!'); setShowForm(false); setForm({ name: '', duration_minutes: 60 }); load()
  }

  async function handleSaveEdit(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('services').update(editForm).eq('id', id)
    if (error) { toast.error('Failed to update.'); return }
    toast.success('Updated!'); setEditId(null); load()
  }

  async function handleArchive(s: Service) {
    const supabase = createClient()
    await supabase.from('services').update({ is_archived: !s.is_archived, archived_at: s.is_archived ? null : new Date().toISOString() }).eq('id', s.id)
    toast.success(s.is_archived ? 'Restored.' : 'Archived.')
    load()
  }

  const inputCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-full'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Services</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium bg-brand">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow p-6 mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-500">Name</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="w-40">
            <label className="text-xs text-gray-500">Duration (min)</label>
            <input type="number" min="1" className={inputCls} value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} required />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl text-white text-sm font-medium bg-brand">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-purple-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className={`border-t ${s.is_archived ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-brand-dark">
                  {editId === s.id ? <input className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /> : s.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {editId === s.id ? <input type="number" className={`${inputCls} w-24`} value={editForm.duration_minutes} onChange={e => setEditForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} /> : `${s.duration_minutes} min`}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_archived ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {s.is_archived ? 'Archived' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editId === s.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(s.id)} className="text-green-600"><Check size={16} /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-400"><XIcon size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(s.id); setEditForm({ name: s.name, duration_minutes: s.duration_minutes }) }} className="text-blue-500"><Edit2 size={14} /></button>
                        <button onClick={() => handleArchive(s)} className="text-gray-400 hover:text-red-500"><Archive size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No services.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
