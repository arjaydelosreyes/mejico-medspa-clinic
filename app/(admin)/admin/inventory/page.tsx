'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Minus } from 'lucide-react'

type Product = {
  id: string; name: string; category: string | null
  quantity: number; low_stock_threshold: number; price: number
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('products').select('id, name, category, quantity, low_stock_threshold, price').eq('is_archived', false).order('name')
    setProducts(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function adjust(id: string, delta: number) {
    const product = products.find(p => p.id === id)
    if (!product) return
    const newQty = Math.max(0, product.quantity + delta)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ quantity: newQty }).eq('id', id)
    if (error) { toast.error('Failed to update quantity.'); return }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: newQty } : p))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#382d6e' }}>Inventory</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#f5f3ff' }}>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const low = p.quantity < p.low_stock_threshold
              return (
                <tr key={p.id} className={`border-t ${low ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#382d6e' }}>{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">₱{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: low ? '#ef4444' : '#382d6e' }}>{p.quantity}</td>
                  <td className="px-4 py-3 text-gray-500">{p.low_stock_threshold}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${low ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {low ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjust(p.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Minus size={10} /></button>
                      <button onClick={() => adjust(p.id, 1)} className="w-6 h-6 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: '#6a4fb3' }}><Plus size={10} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No products.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
