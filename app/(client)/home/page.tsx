'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Carousel } from '@/components/public/Carousel'
import { LandingAbout } from '@/components/public/LandingAbout'

export default function HomePage() {
  const { profile } = useAuth()

  return (
    <div>
      {/* Welcome hero */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center"
        style={{
          backgroundImage: 'url(/images/mejicobgimage.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(var(--brand-deeper-rgb), 0.65)' }}
        />
        <div className="relative z-10 px-6 max-w-3xl">
          <Image
            src="/images/mejico-MDSpa-logo-transparent.png"
            alt="Mejico MedSpa"
            width={140}
            height={140}
            className="mx-auto mb-6 animate-pulse"
          />
          <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
            Welcome back,{' '}
            <span className="text-brand-light">{profile?.first_name ?? 'there'}</span>
          </h1>
          <p className="text-purple-200 text-lg mb-8">
            Your wellness journey continues. Book your next appointment today.
          </p>
          <Link
            href="/appointment"
            className="inline-block px-8 py-3 rounded-full text-white font-semibold text-lg transition hover:opacity-90 bg-gradient-to-br from-brand-light to-brand-dark"
          >
            Book Appointment
          </Link>
        </div>
      </section>

      <Carousel />
      <LandingAbout />
    </div>
  )
}
