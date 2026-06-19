'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Package, Boxes, ClipboardList,
  Scissors, List, Users, UserCog,
  CalendarCheck, CalendarDays, Calendar,
  LogOut, Menu, X, ShoppingBag,
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: React.ReactNode }
type NavSection = { title: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: <Package size={16} /> },
      { label: 'Inventory', href: '/admin/inventory', icon: <Boxes size={16} /> },
      { label: 'Product Manage', href: '/admin/product-manage', icon: <ShoppingBag size={16} /> },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Services', href: '/admin/services', icon: <Scissors size={16} /> },
      { label: 'Treatments', href: '/admin/treatments', icon: <ClipboardList size={16} /> },
      { label: 'Treatment Lists', href: '/admin/treatment-lists', icon: <List size={16} /> },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Clients', href: '/admin/clients', icon: <Users size={16} /> },
      { label: 'Profiles', href: '/admin/profiles', icon: <UserCog size={16} /> },
    ],
  },
  {
    title: 'Schedule',
    items: [
      { label: 'Appointments', href: '/admin/appointments', icon: <CalendarCheck size={16} /> },
      { label: 'Appt Lists', href: '/admin/appointment-lists', icon: <CalendarDays size={16} /> },
      { label: 'Calendar', href: '/admin/calendar', icon: <Calendar size={16} /> },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1a1040' }}>
      {/* Logo */}
      <div className="p-4 border-b border-purple-900">
        <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
          <Image src="/images/mejico-MDSpa-logo-ntext.png" alt="Mejico MedSpa" width={120} height={40} className="object-contain" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {NAV.map(section => (
          <div key={section.title}>
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-purple-400">
              {section.title}
            </p>
            {section.items.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition mb-0.5 ${
                    active
                      ? 'bg-purple-800 text-white'
                      : 'text-purple-200 hover:bg-purple-900 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-purple-900">
        <p className="text-xs text-purple-400 truncate mb-2">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-purple-300 hover:text-white transition w-full"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 w-60 h-full flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white"
        style={{ backgroundColor: '#6a4fb3' }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 h-full flex flex-col">
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)}>
            <button className="absolute top-4 right-4 text-white" onClick={() => setOpen(false)}>
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
