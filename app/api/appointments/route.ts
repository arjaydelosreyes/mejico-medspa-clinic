import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    let query = supabase
      .from('appointments')
      .select('*, profiles(first_name, last_name), appointment_services(quantity, unit_price, services(name))')
      .order('appointment_date', { ascending: false })

    if (profile.role !== 'admin') {
      query = query.eq('client_id', profile.id)
    }

    const { data: appointments, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ appointments })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const body = await req.json()
    const { appointment_date, appointment_time, notes, services } = body

    if (!appointment_date || !appointment_time) {
      return NextResponse.json({ error: 'appointment_date and appointment_time are required' }, { status: 400 })
    }

    // Server-side pricing: look up trusted prices from the services table
    type ServiceInput = { service_id: string; quantity?: number }
    const serviceRows: { appointment_id: string; service_id: string; quantity: number; unit_price: number }[] = []
    let total_price = 0

    if (Array.isArray(services) && services.length > 0) {
      const serviceIds = (services as ServiceInput[]).map(s => s.service_id)
      const { data: dbServices, error: svcLookupError } = await supabase
        .from('services')
        .select('id, name')
        .in('id', serviceIds)

      if (svcLookupError) return NextResponse.json({ error: svcLookupError.message }, { status: 500 })

      // Reject request if any service_id is unknown
      const foundIds = new Set((dbServices ?? []).map((s: { id: string }) => s.id))
      const unknown = serviceIds.filter(id => !foundIds.has(id))
      if (unknown.length > 0) {
        return NextResponse.json({ error: `Unknown service IDs: ${unknown.join(', ')}` }, { status: 400 })
      }

      // Fetch treatment prices linked to these services (use first treatment price per service as unit price)
      const { data: treatments } = await supabase
        .from('treatments')
        .select('service_id, price')
        .in('service_id', serviceIds)
        .eq('is_archived', false)

      const priceByService: Record<string, number> = {}
      for (const t of treatments ?? []) {
        if (!(t.service_id in priceByService)) priceByService[t.service_id] = Number(t.price)
      }

      for (const s of services as ServiceInput[]) {
        const qty = Math.max(1, Math.floor(s.quantity ?? 1))
        const unit = priceByService[s.service_id] ?? 0
        total_price += qty * unit
        serviceRows.push({ appointment_id: '', service_id: s.service_id, quantity: qty, unit_price: unit })
      }
    }

    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({ client_id: profile.id, appointment_date, appointment_time, notes, total_price })
      .select()
      .single()

    if (apptError) return NextResponse.json({ error: apptError.message }, { status: 500 })

    if (serviceRows.length > 0) {
      const rows = serviceRows.map(r => ({ ...r, appointment_id: appointment.id }))
      const { error: svcError } = await supabase.from('appointment_services').insert(rows)
      if (svcError) return NextResponse.json({ error: svcError.message }, { status: 500 })
    }

    return NextResponse.json({ appointment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
