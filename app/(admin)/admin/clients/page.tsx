'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Client = {
  id: string; first_name: string | null; last_name: string | null; username: string | null
  phone: string | null; gender: string | null; date_of_birth: string | null; created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('profiles').select('id, first_name, last_name, username, phone, gender, date_of_birth, created_at')
      .eq('role', 'client').order('created_at', { ascending: false })
      .then(({ data }) => setClients(data ?? []))
  }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return (
      (c.first_name ?? '').toLowerCase().includes(q) ||
      (c.last_name ?? '').toLowerCase().includes(q) ||
      (c.username ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-brand-dark">Clients</h1>
      <input
        placeholder="Search by name or username…"
        value={search} onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
      />
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-purple-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Date of Birth</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3 font-medium text-brand-dark">
                  {[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.username ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{c.gender ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.date_of_birth ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No clients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
