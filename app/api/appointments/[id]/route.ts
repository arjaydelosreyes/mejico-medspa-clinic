import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const body = await req.json()
    const { status, appointment_date, appointment_time, notes } = body

    const updates: Record<string, unknown> = {}

    if (profile.role === 'admin') {
      // Admins may update any field including status
      if (status !== undefined) updates.status = status
      if (appointment_date !== undefined) updates.appointment_date = appointment_date
      if (appointment_time !== undefined) updates.appointment_time = appointment_time
      if (notes !== undefined) updates.notes = notes
    } else {
      // Clients may only reschedule or update notes on their own appointments — not status
      if (appointment_date !== undefined) updates.appointment_date = appointment_date
      if (appointment_time !== undefined) updates.appointment_time = appointment_time
      if (notes !== undefined) updates.notes = notes
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No permitted fields to update' }, { status: 400 })
    }

    let query = supabase
      .from('appointments')
      .update(updates)
      .eq('id', params.id)

    // Non-admins can only update their own appointments
    if (profile.role !== 'admin') {
      query = query.eq('client_id', profile.id)
    }

    const { data: appointment, error } = await query.select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

    return NextResponse.json({ appointment })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return auth.response
    const { user, supabase } = auth

    // Only admins may delete appointments
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'Appointment deleted' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
