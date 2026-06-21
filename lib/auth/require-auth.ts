import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export type AuthSuccess = { authorized: true; user: User; supabase: SupabaseClient }
export type AuthFailure = { authorized: false; response: NextResponse }
export type AuthResult  = AuthSuccess | AuthFailure

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { authorized: true, user, supabase }
}
