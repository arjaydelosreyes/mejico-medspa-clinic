'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ApptRow = {
  id: string; appointment_date: string; appointment_time: string
  status: string; total_price: number; notes: string | null
  profiles: { first_name: string | null; last_name: string | null } | null
  appointment_services: { quantity: number; unit_price: number; services: { name: string } | null }[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AppointmentListsPage() {
  const [rows, setRows] = useState<ApptRow[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, status, total_price, notes, profiles!inner(first_name, last_name), appointment_services(quantity, unit_price, services(name))')
      .order('appointment_date', { ascending: false })
      .then(({ data }) => setRows((data ?? []) as unknown as ApptRow[]))
  }, [])

  const filtered = rows.filter(r => {
    if (dateFrom && r.appointment_date < dateFrom) return false
    if (dateTo && r.appointment_date > dateTo) return false
    return true
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-brand-dark">Appointment Lists</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }}
            className="mt-5 text-xs text-purple-600 hover:underline self-center">Clear</button>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-brand-dark">
                  {[a.profiles?.first_name, a.profiles?.last_name].filter(Boolean).join(' ') || 'Unknown Client'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {a.appointment_date} at {a.appointment_time}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-brand">₱{Number(a.total_price).toFixed(2)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {a.status}
                </span>
              </div>
            </div>
            {a.appointment_services.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Services</p>
                <div className="flex flex-wrap gap-2">
                  {a.appointment_services.map((as, i) => (
                    <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      {as.services?.name ?? '?'} ×{as.quantity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">No appointments in range.</p>
        )}
      </div>
    </div>
  )
}
