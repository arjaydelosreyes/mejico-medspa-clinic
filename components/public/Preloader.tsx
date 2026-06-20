'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'

export function Preloader({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  // Refs so the effect runs ONCE but always calls the latest values
  const lenisRef = useRef(lenis)
  const onDoneRef = useRef(onDone)
  lenisRef.current = lenis
  onDoneRef.current = onDone

  useLayoutEffect(() => {
    lenisRef.current?.stop()
    document.body.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = ''
          lenisRef.current?.start()
          onDoneRef.current()
        },
      })

      // Phase 0 — logo sting entrance
      tl.from('.pl-logo', { scale: 0.55, opacity: 0, duration: 0.7, ease: 'back.out(2)' }, 0)
        .from('.pl-wordmark', { y: 18, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0.2)
        .from('.pl-tagline', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.5)
        .from('.pl-bar-fill', { scaleX: 0, duration: 1.7, ease: 'power4.inOut', transformOrigin: 'left center' }, 0.3)

      // Phase 0 exit — supporting elements slip away, logo rushes toward viewer
      tl.to(['.pl-wordmark', '.pl-tagline', '.pl-bar-fill'], {
        opacity: 0, y: -8, duration: 0.4, ease: 'power2.in',
      }, 1.5)
      tl.to('.pl-logo', {
        scale: 3,
        transformPerspective: 600,
        z: 200,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.in',
      }, 1.55)

      // Phase 0 → 1 bridge: sting background clears
      tl.to('.pl-sting', { opacity: 0, duration: 0.15, ease: 'none' }, 2.1)

      // Phase 1 — curtain split
      tl.to('.pl-curtain-top', { y: '-100%', duration: 0.9, ease: 'power4.inOut' }, 2.3)
        .to('.pl-curtain-bottom', { y: '100%', duration: 0.9, ease: 'power4.inOut' }, 2.3)
    }, containerRef)

    return () => {
      ctx.revert()
      document.body.style.overflow = ''
      lenisRef.current?.start()
    }
  }, []) // Empty — run once on mount; refs carry latest values

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Phase 1 — curtain panels (sit below sting; split open at t=2s) */}
      <div
        className="pl-curtain-top absolute left-0 right-0 top-0 bottom-1/2"
        style={{ backgroundColor: 'var(--brand-deeper)', willChange: 'transform' }}
      />
      <div
        className="pl-curtain-bottom absolute left-0 right-0 top-1/2 bottom-0"
        style={{ backgroundColor: 'var(--brand-deeper)', willChange: 'transform' }}
      />

      {/* Phase 0 — sting panel (renders above curtains so logo is visible) */}
      <div
        className="pl-sting absolute inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: 'var(--brand-deeper)' }}
      >
        <div className="pl-logo">
          <Image
            src="/images/mejico-MDSpa-logo-transparent.png"
            alt=""
            width={96}
            height={96}
            priority
          />
        </div>
        <p className="pl-wordmark mt-3 text-white text-xl font-serif tracking-widest">
          Mejico MedSpa
        </p>
        <p className="pl-tagline mt-2 text-purple-300 text-sm tracking-wider">
          Reveal Your Best Self.
        </p>
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="pl-bar-fill h-full origin-left"
            style={{ backgroundColor: 'var(--brand-light)' }}
          />
        </div>
      </div>
    </div>
  )
}
