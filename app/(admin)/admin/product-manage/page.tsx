'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Archive } from 'lucide-react'

type Product = {
  id: string; name: string; description: string | null; category: string | null
  price: number; quantity: number; low_stock_threshold: number; is_archived: boolean
}

const EMPTY_FORM = { name: '', description: '', category: '', price: 0, quantity: 0, low_stock_threshold: 10 }

export default function ProductManagePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [isNew, setIsNew] = useState(true)
  const [loading, setLoading] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data ?? [])
  }
  useEffect(() => { load() }, [])

  function selectProduct(p: Product) {
    setSelected(p)
    setIsNew(false)
    setForm({ name: p.name, description: p.description ?? '', category: p.category ?? '', price: p.price, quantity: p.quantity, low_stock_threshold: p.low_stock_threshold })
  }

  function newProduct() {
    setSelected(null)
    setIsNew(true)
    setForm({ ...EMPTY_FORM })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    if (isNew) {
      const { error } = await supabase.from('products').insert(form)
      if (error) { toast.error('Failed to add.'); setLoading(false); return }
      toast.success('Product added!')
    } else if (selected) {
      const { error } = await supabase.from('products').update(form).eq('id', selected.id)
      if (error) { toast.error('Failed to update.'); setLoading(false); return }
      toast.success('Product updated!')
    }
    setLoading(false); newProduct(); load()
  }

  async function handleArchive() {
    if (!selected) return
    const supabase = createClient()
    await supabase.from('products').update({ is_archived: !selected.is_archived, archived_at: selected.is_archived ? null : new Date().toISOString() }).eq('id', selected.id)
    toast.success(selected.is_archived ? 'Restored.' : 'Archived.')
    newProduct(); load()
  }

  const inputCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-full'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#382d6e' }}>Product Manage</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Product list */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-sm" style={{ color: '#382d6e' }}>All Products</h2>
            <button onClick={newProduct} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: '#6a4fb3' }}>
              <Plus size={12} /> New
            </button>
          </div>
          <div className="overflow-y-auto max-h-96">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => selectProduct(p)}
                className={`w-full text-left px-4 py-3 border-b text-sm transition ${selected?.id === p.id ? 'bg-purple-50' : 'hover:bg-gray-50'} ${p.is_archived ? 'opacity-50' : ''}`}
              >
                <p className="font-medium truncate" style={{ color: '#382d6e' }}>{p.name}</p>
                <p className="text-xs text-gray-500">₱{Number(p.price).toFixed(2)} · Qty: {p.quantity} {p.is_archived ? '(archived)' : ''}</p>
              </button>
            ))}
            {products.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No products.</p>}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#382d6e' }}>
            {isNew ? 'New Product' : `Editing: ${selected?.name}`}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="text-xs text-gray-500">Name</label><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div><label className="text-xs text-gray-500">Category</label><input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">Price (₱)</label><input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required /></div>
              <div><label className="text-xs text-gray-500">Qty</label><input type="number" min="0" className={inputCls} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
              <div><label className="text-xs text-gray-500">Low Threshold</label><input type="number" min="0" className={inputCls} value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: Number(e.target.value) }))} /></div>
            </div>
            <div><label className="text-xs text-gray-500">Description</label><textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ backgroundColor: '#6a4fb3' }}>
                {loading ? 'Saving…' : isNew ? 'Add Product' : 'Save Changes'}
              </button>
              {!isNew && (
                <button type="button" onClick={handleArchive} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm flex items-center gap-1">
                  <Archive size={14} /> {selected?.is_archived ? 'Restore' : 'Archive'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
