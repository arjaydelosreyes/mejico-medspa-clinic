'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Settings, Shield, LogOut, Calendar, List, Tag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [servicesOpen, setServicesOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const initials =
    `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`hover:text-purple-300 transition text-sm ${pathname === href ? 'text-purple-300 font-semibold underline underline-offset-4' : 'text-white'}`}
    >
      {label}
    </Link>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-brand-deeper">
      <Link href="/home">
        <Image
          src="/images/mejico-MDSpa-logo-ntext.png"
          alt="Mejico MedSpa"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
        />
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        {navLink('/home', 'Home')}
        {navLink('/about', 'About')}

        {/* Services dropdown */}
        <div ref={servicesRef} className="relative">
          <button
            onClick={() => setServicesOpen(o => !o)}
            className="flex items-center gap-1 text-white text-sm hover:text-purple-300 transition"
          >
            Services
            <ChevronDown size={14} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
          </button>
          {servicesOpen && (
            <div className="absolute top-full left-0 mt-2 w-52 rounded-xl shadow-xl py-1 z-50 bg-brand-dark">
              <Link href="/appointment" className="flex items-center gap-2 px-4 py-2.5 text-white hover:bg-purple-800 transition text-sm" onClick={() => setServicesOpen(false)}>
                <List size={14} /> Appointments
              </Link>
              <Link href="/calendar" className="flex items-center gap-2 px-4 py-2.5 text-white hover:bg-purple-800 transition text-sm" onClick={() => setServicesOpen(false)}>
                <Calendar size={14} /> View Calendar
              </Link>
              <Link href="/offers" className="flex items-center gap-2 px-4 py-2.5 text-white hover:bg-purple-800 transition text-sm" onClick={() => setServicesOpen(false)}>
                <Tag size={14} /> Offers
              </Link>
            </div>
          )}
        </div>

        {navLink('/contact', 'Contact')}
      </nav>

      {/* User dropdown */}
      <div ref={userRef} className="relative">
        <button
          onClick={() => setUserOpen(o => !o)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition bg-brand"
        >
          {initials}
        </button>

        {userOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 rounded-xl shadow-xl py-1 z-50 bg-brand-dark">
            <div className="px-4 py-3 border-b border-purple-700">
              <p className="text-white text-sm font-semibold truncate">
                {profile?.username ?? `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()}
              </p>
              <p className="text-purple-300 text-xs capitalize">{profile?.role}</p>
            </div>
            <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-white hover:bg-purple-800 transition text-sm" onClick={() => setUserOpen(false)}>
              <Settings size={14} /> Customize Profile
            </Link>
            <Link href="/security" className="flex items-center gap-2 px-4 py-2.5 text-white hover:bg-purple-800 transition text-sm" onClick={() => setUserOpen(false)}>
              <Shield size={14} /> Personal Security
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-red-300 hover:bg-red-900 transition text-sm"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
