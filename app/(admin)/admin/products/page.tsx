'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Archive, Edit2, Check, X as XIcon } from 'lucide-react'

type Product = {
  id: string; name: string; description: string | null; category: string | null
  price: number; quantity: number; low_stock_threshold: number; is_archived: boolean
}

const EMPTY: Omit<Product, 'id' | 'is_archived'> = {
  name: '', description: '', category: '', price: 0, quantity: 0, low_stock_threshold: 10,
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY })

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data ?? [])
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    if (!showArchived && p.is_archived) return false
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.category ?? '').toLowerCase().includes(q)
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('products').insert({ ...form })
    if (error) { toast.error('Failed to add product.'); return }
    toast.success('Product added!'); setShowForm(false); setForm({ ...EMPTY }); load()
  }

  async function handleSaveEdit(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('products').update(editForm).eq('id', id)
    if (error) { toast.error('Failed to update.'); return }
    toast.success('Updated!'); setEditId(null); load()
  }

  async function handleArchive(p: Product) {
    const supabase = createClient()
    await supabase.from('products').update({ is_archived: !p.is_archived, archived_at: p.is_archived ? null : new Date().toISOString() }).eq('id', p.id)
    toast.success(p.is_archived ? 'Restored.' : 'Archived.')
    load()
  }

  const inputCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-full'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#382d6e' }}>Products</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#6a4fb3' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow p-6 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-gray-500">Name</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-gray-500">Category</label>
            <input className={inputCls} value={form.category ?? ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Price (₱)</label>
            <input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className="text-xs text-gray-500">Quantity</label>
            <input type="number" min="0" className={inputCls} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className="text-xs text-gray-500">Low Stock Threshold</label>
            <input type="number" min="0" className={inputCls} value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: Number(e.target.value) }))} />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className="text-xs text-gray-500">Description</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="col-span-2 md:col-span-3 flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#6a4fb3' }}>Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none flex-1 min-w-48" />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#f5f3ff' }}>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <>
                <tr key={p.id} className={`border-t ${p.is_archived ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#382d6e' }}>
                    {editId === p.id ? <input className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /> : p.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {editId === p.id ? <input className={inputCls} value={editForm.category ?? ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} /> : (p.category ?? '—')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {editId === p.id ? <input type="number" step="0.01" className={inputCls} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} /> : `₱${Number(p.price).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {editId === p.id ? <input type="number" className={inputCls} value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: Number(e.target.value) }))} /> : p.quantity}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_archived ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {p.is_archived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {editId === p.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(p.id)} className="text-green-600 hover:text-green-800"><Check size={16} /></button>
                          <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><XIcon size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(p.id); setEditForm({ name: p.name, description: p.description, category: p.category, price: p.price, quantity: p.quantity, low_stock_threshold: p.low_stock_threshold }) }}
                            className="text-blue-500 hover:text-blue-700"><Edit2 size={14} /></button>
                          <button onClick={() => handleArchive(p)} className="text-gray-400 hover:text-red-500"><Archive size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
