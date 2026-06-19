import Link from 'next/link'
import Image from 'next/image'
import { Mail, CheckCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1a1040, #382d6e)' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-center">
        <div
          className="px-8 py-6"
          style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}
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
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#ede9ff' }}
            >
              <Mail size={32} style={{ color: '#6a4fb3' }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#382d6e' }}>
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
          <Link
            href="/login"
            className="inline-block w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
