'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CalendarPlus, Plus, Minus, Clock } from 'lucide-react'

type Service = { id: string; name: string; duration_minutes: number }
type Treatment = { id: string; service_id: string; name: string; price: number; description: string | null }
type Appointment = {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  total_price: number
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AppointmentPage() {
  const { profile } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'book' | 'view'>('book')

  const loadAppointments = useCallback(async () => {
    if (!profile) return
    const supabase = createClient()
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', profile.id)
      .order('appointment_date', { ascending: false })
    setAppointments(data ?? [])
  }, [profile])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('services').select('*').eq('is_archived', false).order('name')
      .then(({ data }) => setServices(data ?? []))
    loadAppointments()
  }, [loadAppointments])

  async function loadTreatmentsForService(serviceId: string) {
    if (treatments.some(t => t.service_id === serviceId)) return
    const supabase = createClient()
    const { data } = await supabase
      .from('treatments')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_archived', false)
    setTreatments(prev => [...prev, ...(data ?? [])])
  }

  function toggleService(id: string) {
    if (expandedService === id) {
      setExpandedService(null)
    } else {
      setExpandedService(id)
      loadTreatmentsForService(id)
    }
  }

  function adjustQty(treatmentId: string, delta: number) {
    setQuantities(prev => {
      const current = prev[treatmentId] ?? 0
      const next = current + delta
      if (next <= 0) {
        const updated = { ...prev }
        delete updated[treatmentId]
        return updated
      }
      return { ...prev, [treatmentId]: next }
    })
  }

  const selectedTreatments = treatments.filter(t => quantities[t.id])
  const totalPrice = selectedTreatments.reduce(
    (sum, t) => sum + Number(t.price) * (quantities[t.id] ?? 0),
    0
  )

  async function handleBook(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    if (selectedTreatments.length === 0) { toast.error('Select at least one treatment.'); return }
    if (!selectedDate || !selectedTime) { toast.error('Select a date and time.'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: appt, error } = await supabase
      .from('appointments')
      .insert({
        client_id: profile.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !appt) {
      toast.error('Failed to book appointment.')
      setLoading(false)
      return
    }

    await supabase.from('appointment_services').insert(
      selectedTreatments.map(t => ({
        appointment_id: appt.id,
        service_id: t.service_id,
        quantity: quantities[t.id],
        unit_price: t.price,
      }))
    )

    toast.success('Appointment booked! Awaiting confirmation.')
    setQuantities({})
    setSelectedDate('')
    setSelectedTime('')
    await loadAppointments()
    setTab('view')
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-16 text-center text-white" style={{ backgroundColor: '#1a1040' }}>
        <CalendarPlus className="mx-auto mb-3" size={36} />
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-purple-300 mt-1">Book and manage your appointments</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1 shadow">
          {(['book', 'view'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${tab === t ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              style={tab === t ? { backgroundColor: '#6a4fb3' } : {}}
            >
              {t === 'book' ? 'Book Appointment' : 'My Appointments'}
            </button>
          ))}
        </div>

        {tab === 'book' && (
          <form onSubmit={handleBook} className="grid md:grid-cols-3 gap-6">
            {/* Services + treatments */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold text-lg mb-4" style={{ color: '#382d6e' }}>
                Select Services &amp; Treatments
              </h2>
              {services.length === 0 && (
                <p className="text-gray-400 text-sm">Loading services...</p>
              )}
              {services.map(service => (
                <div key={service.id} className="mb-3">
                  <button
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className="w-full flex justify-between items-center px-4 py-3 rounded-xl text-left text-sm font-medium text-white transition"
                    style={{ backgroundColor: expandedService === service.id ? '#382d6e' : '#6a4fb3' }}
                  >
                    {service.name}
                    <span className="text-lg leading-none">{expandedService === service.id ? '−' : '+'}</span>
                  </button>
                  {expandedService === service.id && (
                    <div className="mt-2 space-y-2 pl-2">
                      {treatments.filter(t => t.service_id === service.id).length === 0 && (
                        <p className="text-xs text-gray-400 px-2">No treatments available.</p>
                      )}
                      {treatments.filter(t => t.service_id === service.id).map(t => (
                        <div key={t.id} className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-2">
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#382d6e' }}>{t.name}</p>
                            <p className="text-xs text-gray-500">₱{Number(t.price).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => adjustQty(t.id, -1)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{quantities[t.id] ?? 0}</span>
                            <button type="button" onClick={() => adjustQty(t.id, 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: '#6a4fb3' }}>
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Booking summary */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4 h-fit">
              <h2 className="font-bold text-lg" style={{ color: '#382d6e' }}>Summary</h2>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Time</label>
                <div className="grid grid-cols-2 gap-1">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${selectedTime === t ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      style={selectedTime === t ? { backgroundColor: '#6a4fb3' } : {}}
                    >
                      <Clock size={10} /> {t}
                    </button>
                  ))}
                </div>
              </div>
              {selectedTreatments.length > 0 && (
                <div className="border-t pt-3 space-y-1">
                  {selectedTreatments.map(t => (
                    <div key={t.id} className="flex justify-between text-xs">
                      <span className="truncate">{t.name} ×{quantities[t.id]}</span>
                      <span>₱{(Number(t.price) * (quantities[t.id] ?? 0)).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm pt-2 border-t" style={{ color: '#382d6e' }}>
                    <span>Total</span>
                    <span>₱{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60 text-sm"
                style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}

        {tab === 'view' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: '#382d6e' }}>My Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No appointments yet.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(appt => (
                  <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#382d6e' }}>{appt.appointment_date}</p>
                      <p className="text-xs text-gray-500">
                        {appt.appointment_time} · ₱{Number(appt.total_price).toFixed(2)}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
