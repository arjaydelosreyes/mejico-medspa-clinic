'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)

    let data: { userId?: string; error?: string } = {}
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.firstName,
          last_name: form.lastName,
          username: form.username,
        }),
      })
      data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Registration failed. Please try again.')
        setLoading(false)
        return
      }
    } catch {
      toast.error('Registration failed. Please try again.')
      setLoading(false)
      return
    }

    toast.success('Account created! Please check your email to verify.')
    router.push('/verify-email')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-brand-deeper to-brand-dark"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-8 py-6 text-white relative bg-gradient-to-br from-brand-light to-brand-dark"
        >
          <Link href="/" className="absolute top-4 left-4 text-white/70 hover:text-white transition">
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
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-purple-200 text-sm mt-1">Join Mejico MedSpa today</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="px-8 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={update('firstName')}
                required
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={update('lastName')}
                required
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={update('username')}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={update('email')}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={update('password')}
              required
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60 bg-gradient-to-br from-brand-light to-brand-dark"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline text-brand">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
