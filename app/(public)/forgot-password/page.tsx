'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-purple-200 text-sm mt-1">
              {sent ? 'Check your inbox' : "We'll send you a reset link"}
            </p>
          </div>
        </div>

        <div className="px-8 py-6">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600 text-sm">
                If that email is registered, a password reset link has been sent.
                Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="block w-full py-3 text-center bg-brand-dark text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-500 text-sm text-center">
                Enter the email address associated with your account.
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-dark text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Remember your password?{' '}
                <Link href="/login" className="text-brand-dark font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
