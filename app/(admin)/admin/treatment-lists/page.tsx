'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = { id: string; name: string; price: number; is_archived: boolean; services: { name: string } | null }

export default function TreatmentListsPage() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('treatments')
      .select('id, name, price, is_archived, services(name)')
      .order('name')
      .then(({ data }) => setRows((data ?? []) as unknown as Row[]))
  }, [])

  const grouped: Record<string, Row[]> = {}
  rows.forEach(r => {
    const svcName = r.services?.name ?? 'Uncategorized'
    if (!grouped[svcName]) grouped[svcName] = []
    grouped[svcName].push(r)
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-brand-dark">Treatment Lists</h1>
      {Object.entries(grouped).map(([service, treatments]) => (
        <div key={service} className="bg-white rounded-2xl shadow mb-6 overflow-hidden">
          <div className="px-5 py-3 font-semibold text-white text-sm bg-brand">
            {service}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-purple-50">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-2">Treatment</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map(t => (
                <tr key={t.id} className={`border-t ${t.is_archived ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-brand-dark">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">₱{Number(t.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.is_archived ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {t.is_archived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {rows.length === 0 && <p className="text-gray-400 text-center py-12">No treatments found.</p>}
    </div>
  )
}
