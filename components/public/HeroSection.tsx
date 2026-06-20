'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLenis } from 'lenis/react'

export function HeroSection({ introReady = false }: { introReady?: boolean }) {
  const bgRef = useRef<HTMLDivElement>(null)

  useLenis(({ scroll }) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (bgRef.current) {
      bgRef.current.style.transform = `translateY(${scroll * 0.3}px)`
    }
  })

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute left-0 right-0 -top-[15%] -bottom-[15%] will-change-transform"
        style={{
          backgroundImage: 'url(/images/mejicobgimage.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Dark brand overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(var(--brand-deeper-rgb), 0.55)' }}
      />

      {/* Two-column hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center pt-20 pb-16">
        {/* Left: text stack */}
        <div className="text-left">
          <p
            data-hero-text
            className="text-brand-light text-xs font-semibold tracking-[0.25em] uppercase mb-5"
            style={{ opacity: 0 }}
          >
            MEDICAL-GRADE AESTHETICS
          </p>
          <h1
            data-hero-text
            className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight"
            style={{ opacity: 0 }}
          >
            Reveal Your<br />Best Self.
          </h1>
          <p
            data-hero-text
            className="text-purple-200 text-lg mb-8 max-w-md"
            style={{ opacity: 0 }}
          >
            Personalized wellness care and medical-grade aesthetics — right here in Calapan City, Oriental Mindoro.
          </p>
          <Link
            data-hero-text
            href="/appointment"
            className="inline-block px-8 py-3 rounded-full text-white font-semibold text-lg transition hover:opacity-90 bg-brand"
            style={{ opacity: 0 }}
          >
            Book Appointment
          </Link>
        </div>

        {/* Right: treatment image — slides in from right */}
        <div
          data-hero-image
          className="hidden md:flex justify-center items-end"
          style={{ opacity: 0 }}
        >
          <Image
            src="/images/mejico-image5.png"
            alt="Treatment at Mejico MedSpa"
            width={480}
            height={560}
            className="object-contain max-h-[65vh]"
            priority
          />
        </div>
      </div>

      {/* Scroll indicator — line grows upward */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div
          data-scroll-line
          className="w-px bg-purple-300"
          style={{ height: '48px', transform: 'scaleY(0)', transformOrigin: 'bottom' }}
        />
      </div>
    </section>
  )
}
