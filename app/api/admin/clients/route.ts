import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response
    const { supabase } = auth

    const { data: clients, error } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, username, phone, gender, date_of_birth, created_at')
      .eq('role', 'client')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ clients })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
