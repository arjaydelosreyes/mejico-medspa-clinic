'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Shield, Check, X } from 'lucide-react'

type Strength = 'weak' | 'moderate' | 'strong'

function getStrength(pw: string): Strength {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[!@#$%^&*]/.test(pw)) score++
  if (score <= 2) return 'weak'
  if (score <= 3) return 'moderate'
  return 'strong'
}

const STRENGTH_COLORS: Record<Strength, string> = {
  weak: '#ef4444',
  moderate: '#f59e0b',
  strong: '#10b981',
}

const STRENGTH_WIDTH: Record<Strength, string> = {
  weak: '33%',
  moderate: '66%',
  strong: '100%',
}

export default function SecurityPage() {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = newPassword ? getStrength(newPassword) : null

  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Number', met: /[0-9]/.test(newPassword) },
    { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(newPassword) },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400'
  const labelClass = 'text-xs font-medium text-gray-500 block mb-1'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-16 text-center text-white bg-brand-deeper">
        <Shield className="mx-auto mb-3" size={36} />
        <h1 className="text-3xl font-bold">Personal Security</h1>
        <p className="text-purple-300 mt-1">Manage your account security settings</p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
        {/* Account info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-lg mb-4 text-brand-dark">Account Info</h2>
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              className={`${inputClass} bg-gray-50 cursor-not-allowed`}
              value={user?.email ?? ''}
              readOnly
              disabled
            />
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-lg mb-4 text-brand-dark">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: STRENGTH_WIDTH[strength],
                        backgroundColor: STRENGTH_COLORS[strength],
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 capitalize font-medium" style={{ color: STRENGTH_COLORS[strength] }}>
                    {strength} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Requirements */}
            {newPassword && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-medium text-gray-500 mb-2">Requirements</p>
                {requirements.map(req => (
                  <div key={req.label} className="flex items-center gap-2">
                    {req.met
                      ? <Check size={12} className="text-green-500 flex-shrink-0" />
                      : <X size={12} className="text-red-400 flex-shrink-0" />
                    }
                    <span className={`text-xs ${req.met ? 'text-gray-700' : 'text-gray-400'}`}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60 bg-gradient-to-br from-brand-light to-brand-dark"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
