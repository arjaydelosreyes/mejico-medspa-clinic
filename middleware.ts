import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password']
const ADMIN_PREFIX = '/admin'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Public routes — no auth needed
  if (PUBLIC_ROUTES.includes(pathname)) {
    return supabaseResponse
  }

  // API routes handle their own auth
  if (pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  // All other routes require a valid session
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Email must be verified before accessing any protected route
  if (!user.email_confirmed_at) {
    const verifyUrl = request.nextUrl.clone()
    verifyUrl.pathname = '/verify-email'
    return NextResponse.redirect(verifyUrl)
  }

  // Admin routes require role = 'admin'
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/home'
      return NextResponse.redirect(homeUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
