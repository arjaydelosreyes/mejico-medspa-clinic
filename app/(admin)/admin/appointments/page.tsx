'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Appointment = {
  id: string; appointment_date: string; appointment_time: string
  status: string; total_price: number; created_at: string
  profiles: { first_name: string | null; last_name: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, status, total_price, created_at, profiles!inner(first_name, last_name)')
      .order('appointment_date', { ascending: false })
    setAppointments((data ?? []) as unknown as Appointment[])
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { toast.error('Failed to update.'); return }
    toast.success('Status updated!')
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const filtered = appointments.filter(a => {
    if (tab !== 'all' && a.status !== tab) return false
    if (!search) return true
    const name = `${a.profiles?.first_name ?? ''} ${a.profiles?.last_name ?? ''}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#382d6e' }}>Appointments</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-2xl p-1 shadow w-fit flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition capitalize ${tab === s ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
            style={tab === s ? { backgroundColor: '#6a4fb3' } : {}}>
            {s}
          </button>
        ))}
      </div>

      <input placeholder="Search by client name…" value={search} onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#f5f3ff' }}>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3 font-medium" style={{ color: '#382d6e' }}>
                  {[a.profiles?.first_name, a.profiles?.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{a.appointment_date}</td>
                <td className="px-4 py-3 text-gray-600">{a.appointment_time}</td>
                <td className="px-4 py-3 text-gray-600">₱{Number(a.total_price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none">
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No appointments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
