'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

type ApptEvent = {
  title: string
  start: Date
  end: Date
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  completed: '#3b82f6',
  cancelled: '#ef4444',
}

export default function CalendarPage() {
  const { profile } = useAuth()
  const [events, setEvents] = useState<ApptEvent[]>([])

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    supabase
      .from('appointments')
      .select('*')
      .eq('client_id', profile.id)
      .then(({ data }) => {
        const mapped: ApptEvent[] = (data ?? []).map(appt => {
          const [h, m] = (appt.appointment_time as string).split(':').map(Number)
          const start = new Date(appt.appointment_date as string)
          start.setHours(h, m, 0, 0)
          const end = new Date(start)
          end.setHours(h + 1)
          return {
            title: `Appointment (${appt.status})`,
            start,
            end,
            status: appt.status as string,
          }
        })
        setEvents(mapped)
      })
  }, [profile])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-16 text-center text-white bg-brand-deeper">
        <h1 className="text-3xl font-bold">My Calendar</h1>
        <p className="text-purple-300 mt-1">View your scheduled appointments</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Legend */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs capitalize">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {status}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            eventPropGetter={(event) => {
              const evt = event as ApptEvent
              return {
                style: {
                  backgroundColor: STATUS_COLORS[evt.status] ?? 'var(--brand)',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                },
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
