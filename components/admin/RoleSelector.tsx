'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateUserRole } from '@/app/actions/admin/role-management'

interface RoleSelectorProps {
  userId:      string
  currentRole: 'client' | 'admin'
  isSelf:      boolean
}

export function RoleSelector({ userId, currentRole, isSelf }: RoleSelectorProps) {
  const [role, setRole]       = useState(currentRole)
  const [loading, setLoading] = useState(false)

  async function handleChange(newRole: 'client' | 'admin') {
    if (newRole === role) return

    if (isSelf && newRole === 'client') {
      toast.error('You cannot remove your own admin role')
      return
    }

    const confirmed = window.confirm(
      newRole === 'admin'
        ? 'Promote this user to Admin? They will have full access to the admin panel.'
        : 'Demote this user to Client? They will lose admin access.'
    )
    if (!confirmed) return

    setLoading(true)
    try {
      await updateUserRole(userId, newRole)
      setRole(newRole)
      toast.success(`Role updated to ${newRole}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={role}
      onChange={e => handleChange(e.target.value as 'client' | 'admin')}
      disabled={loading || isSelf}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
      title={isSelf ? 'You cannot change your own role' : undefined}
    >
      <option value="client">Client</option>
      <option value="admin">Admin</option>
    </select>
  )
}
