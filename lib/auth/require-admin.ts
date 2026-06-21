import { NextResponse } from 'next/server'
import { requireAuth } from './require-auth'
import type { AuthFailure, AuthSuccess } from './require-auth'

export type AdminResult = AuthSuccess | AuthFailure

export async function requireAdmin(): Promise<AdminResult> {
  const result = await requireAuth()
  if (!result.authorized) return result

  const { data: profile } = await result.supabase
    .from('profiles')
    .select('role')
    .eq('user_id', result.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { authorized: true, user: result.user, supabase: result.supabase }
}
