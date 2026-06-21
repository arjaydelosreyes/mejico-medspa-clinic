'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    setResending(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      await supabase.auth.resend({ type: 'signup', email: session.user.email })
    }
    setResending(false)
    setResent(true)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-deeper to-brand-dark"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-center">
        <div
          className="px-8 py-6 bg-gradient-to-br from-brand-light to-brand-dark"
        >
          <Image
            src="/images/mejico-MDSpa-logo-ntext.png"
            alt="Mejico MedSpa"
            width={100}
            height={36}
            className="mx-auto h-9 w-auto object-contain"
          />
        </div>
        <div className="px-8 py-10">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-100"
            >
              <Mail size={32} className="text-brand" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-brand-dark">
            Check Your Email
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            We sent a verification link to your email address.<br />
            Please check your inbox and click the link to activate your account.
          </p>
          <div className="flex items-center gap-2 justify-center text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3 mb-6">
            <CheckCircle size={16} />
            <span>Verification email sent successfully</span>
          </div>
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="mt-4 text-sm text-purple-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resent ? 'Verification email sent!' : resending ? 'Sending…' : 'Resend verification email'}
          </button>
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-block w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 bg-gradient-to-br from-brand-light to-brand-dark"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
