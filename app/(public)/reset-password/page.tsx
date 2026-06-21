'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No active session — user navigated here directly without a reset link
        router.replace('/forgot-password')
      } else {
        setSessionReady(true)
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Invalidate the recovery session
    await supabase.auth.signOut()
    router.push('/login?message=password_reset_success')
  }

  if (!sessionReady) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-deeper to-brand-dark">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 text-white relative bg-gradient-to-br from-brand-light to-brand-dark">
          <Link href="/login" className="absolute top-4 left-4 text-white/70 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center mt-4">
            <Image
              src="/images/mejico-MDSpa-logo-ntext.png"
              alt="Mejico MedSpa"
              width={100}
              height={36}
              className="mx-auto mb-3 h-9 w-auto object-contain"
            />
            <h1 className="text-2xl font-bold">New Password</h1>
            <p className="text-purple-200 text-sm mt-1">Choose a strong password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password (min. 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-dark text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
