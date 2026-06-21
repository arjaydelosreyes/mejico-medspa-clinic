import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return auth.response
    const { user, supabase } = auth

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
    const auth = await requireAuth()
    if (!auth.authorized) return auth.response
    const { user, supabase } = auth

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const body = await req.json()
    const { appointment_date, appointment_time, notes, treatments } = body

    if (!appointment_date || !appointment_time) {
      return NextResponse.json({ error: 'appointment_date and appointment_time are required' }, { status: 400 })
    }

    // Server-side pricing: look up trusted prices from the treatments table
    type TreatmentInput = { treatment_id: string; quantity?: number }
    const serviceRows: { appointment_id: string; service_id: string; quantity: number; unit_price: number }[] = []
    let total_price = 0

    if (Array.isArray(treatments) && treatments.length > 0) {
      const treatmentIds = (treatments as TreatmentInput[]).map(t => t.treatment_id)

      const { data: dbTreatments, error: tErr } = await supabase
        .from('treatments')
        .select('id, service_id, price')
        .in('id', treatmentIds)
        .eq('is_archived', false)

      if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })

      // Reject unknown or archived treatment IDs
      const foundIds = new Set((dbTreatments ?? []).map((t: { id: string }) => t.id))
      const unknown = treatmentIds.filter(id => !foundIds.has(id))
      if (unknown.length > 0) {
        return NextResponse.json({ error: `Unknown or archived treatment IDs: ${unknown.join(', ')}` }, { status: 400 })
      }

      const priceMap = Object.fromEntries(
        (dbTreatments ?? []).map((t: { id: string; service_id: string; price: number }) => [
          t.id,
          { price: Number(t.price), service_id: t.service_id },
        ])
      )

      for (const t of treatments as TreatmentInput[]) {
        const qty = Math.max(1, Math.floor(t.quantity ?? 1))
        const { price, service_id } = priceMap[t.treatment_id]
        total_price += qty * price
        serviceRows.push({ appointment_id: '', service_id, quantity: qty, unit_price: price })
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
