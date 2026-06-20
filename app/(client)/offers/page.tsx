'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
}

const PRODUCT_IMAGES = [
  '/images/productimg1.png',
  '/images/productimg2.png',
  '/images/productimg3.png',
  '/images/productimg4.png',
  '/images/productimg5.png',
  '/images/productimg6.png',
  '/images/productimg7.png',
]

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('id, name, description, category, price')
      .eq('is_archived', false)
      .order('name')
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-16 text-center text-white bg-brand-deeper">
        <h1 className="text-3xl font-bold">Products &amp; Offers</h1>
        <p className="text-purple-300 mt-1">Premium medical spa products for your wellness</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            {search ? 'No products match your search.' : 'No products available.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <div key={product.id} className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.category && (
                    <span
                      className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full text-white font-medium bg-brand"
                    >
                      {product.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 text-brand-dark">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-brand">
                      ₱{Number(product.price).toFixed(2)}
                    </span>
                    <Link
                      href="/appointment"
                      className="text-xs px-3 py-1.5 rounded-full text-white transition hover:opacity-80 bg-brand"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
