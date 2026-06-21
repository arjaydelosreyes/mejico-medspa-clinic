'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

function getRequestMeta() {
  const h = headers()
  return {
    ipAddress: h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0].trim() ?? undefined,
    userAgent: h.get('user-agent') ?? undefined,
  }
}

export async function logLoginEvent(
  result: 'login_success' | 'login_failure',
  email?: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const meta = getRequestMeta()

  await logAuditEvent({
    userId:   user?.id ?? null,
    action:   result,
    metadata: email ? { email: email.slice(0, 3) + '***' } : {},
    ...meta,
  })
}
