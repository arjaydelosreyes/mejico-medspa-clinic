'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

export async function updateUserRole(
  targetUserId: string,
  newRole: 'client' | 'admin'
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (newRole !== 'client' && newRole !== 'admin') throw new Error('Invalid role')

  // Validate the requesting user is an admin
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (myProfile?.role !== 'admin') throw new Error('Forbidden')

  // Prevent self-demotion to avoid admin lockout
  if (targetUserId === user.id && newRole === 'client') {
    throw new Error('You cannot remove your own admin role')
  }

  // Fetch current role for audit metadata
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', targetUserId)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('user_id', targetUserId)

  if (error) throw error

  await logAuditEvent({
    userId:     user.id,
    action:     'role_change',
    targetType: 'user',
    targetId:   targetUserId,
    metadata:   { from: targetProfile?.role ?? 'unknown', to: newRole },
  })

  revalidatePath('/admin/clients')
}
