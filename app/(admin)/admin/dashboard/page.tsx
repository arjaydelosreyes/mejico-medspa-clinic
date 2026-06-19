'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, CalendarCheck, Clock, AlertTriangle } from 'lucide-react'

type RecentAppt = {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  total_price: number
  profiles: { first_name: string | null; last_name: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ clients: 0, appointments: 0, pending: 0, lowStock: 0 })
  const [recent, setRecent] = useState<RecentAppt[]>([])

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('quantity, low_stock_threshold').eq('is_archived', false),
      supabase.from('appointments')
        .select('id, appointment_date, appointment_time, status, total_price, profiles!inner(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then(([clients, appts, pending, products, recentAppts]) => {
      const lowStock = (products.data ?? []).filter(p => p.quantity < p.low_stock_threshold).length
      setStats({
        clients: clients.count ?? 0,
        appointments: appts.count ?? 0,
        pending: pending.count ?? 0,
        lowStock,
      })
      setRecent((recentAppts.data ?? []) as unknown as RecentAppt[])
    })
  }, [])

  const cards = [
    { label: 'Total Clients', value: stats.clients, icon: <Users size={20} />, color: '#6a4fb3' },
    { label: 'Total Appointments', value: stats.appointments, icon: <CalendarCheck size={20} />, color: '#382d6e' },
    { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: '#f59e0b' },
    { label: 'Low Stock Products', value: stats.lowStock, icon: <AlertTriangle size={20} />, color: '#ef4444' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#382d6e' }}>Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: c.color }}>
              {c.icon}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-bold text-lg mb-4" style={{ color: '#382d6e' }}>Recent Appointments</h2>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No appointments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 pr-4">Client</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2 pr-4">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(a => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium" style={{ color: '#382d6e' }}>
                      {a.profiles?.first_name ?? '—'} {a.profiles?.last_name ?? ''}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{a.appointment_date}</td>
                    <td className="py-2 pr-4 text-gray-600">{a.appointment_time}</td>
                    <td className="py-2 pr-4 text-gray-600">₱{Number(a.total_price).toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
