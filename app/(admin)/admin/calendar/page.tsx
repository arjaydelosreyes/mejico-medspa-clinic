'use client'

import { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

type ApptEvent = { title: string; start: Date; end: Date; status: string }

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  completed: '#3b82f6',
  cancelled: '#ef4444',
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<ApptEvent[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('appointments')
      .select('appointment_date, appointment_time, status, profiles!inner(first_name, last_name)')
      .then(({ data }) => {
        const mapped: ApptEvent[] = (data ?? []).map((appt: Record<string, unknown>) => {
          const [h, m] = (appt.appointment_time as string).split(':').map(Number)
          const start = new Date(appt.appointment_date as string)
          start.setHours(h, m, 0, 0)
          const end = new Date(start)
          end.setHours(h + 1)
          const p = appt.profiles as { first_name: string | null; last_name: string | null } | null
          const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || 'Client'
          return {
            title: `${name} (${appt.status as string})`,
            start,
            end,
            status: appt.status as string,
          }
        })
        setEvents(mapped)
      })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-brand-dark">Appointments Calendar</h1>

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
  )
}
