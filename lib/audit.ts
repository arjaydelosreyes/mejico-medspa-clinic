import { createServiceClient } from '@/lib/supabase/service'

export type AuditAction =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'role_change'
  | 'password_reset_request'
  | 'appointment_status_change'
  | 'cancellation_approved'
  | 'cancellation_rejected'

export interface AuditEvent {
  userId: string | null
  action: AuditAction
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('audit_logs').insert({
      user_id:     event.userId ?? null,
      action:      event.action,
      target_type: event.targetType ?? null,
      target_id:   event.targetId ?? null,
      metadata:    event.metadata ?? {},
      ip_address:  event.ipAddress ?? null,
      user_agent:  event.userAgent ?? null,
    })
  } catch {
    // Audit log failure must never crash the main flow — silently swallow
  }
}
