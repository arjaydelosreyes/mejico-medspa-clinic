import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/home'
  // Reject anything that isn't a same-site path (prevents open redirect)
  const next =
    typeof rawNext === 'string' &&
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.startsWith('/\\')
      ? rawNext
      : '/home'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Password recovery — let /reset-password handle the new password form
      if (next === '/reset-password') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Route by role for normal auth (email verification, OAuth, magic link)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        const destination = profile?.role === 'admin' ? '/admin/dashboard' : '/home'
        return NextResponse.redirect(`${origin}${destination}`)
      }

      return NextResponse.redirect(`${origin}/home`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
